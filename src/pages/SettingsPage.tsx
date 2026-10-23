import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { Banner } from '../components/ui/Banner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/toastContext';
import { TopBar } from '../components/ui/TopBar';
import { backupService } from '../db/backup';
import { recipeRepo } from '../db/recipeRepo';
import { formatDate } from '../lib/date';
import { canShareFile, downloadFile, shareFile } from '../lib/deliverFile';
import { getLastBackupAt, setLastBackupAt } from '../lib/prefs';

const DAY = 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0KB';
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function SettingsPage() {
  const toast = useToast();
  const recipeCount = useLiveQuery(() => recipeRepo.count(), []) ?? 0;
  const dataSize = useLiveQuery(() => recipeRepo.dataSize().catch(() => undefined), []);
  const [lastBackupAt, setLast] = useState(getLastBackupAt);
  const [file, setFile] = useState<File>();
  const [building, setBuilding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const markBackedUp = () => {
    const now = Date.now();
    setLastBackupAt(now);
    setLast(now);
  };

  const build = async () => {
    setBuilding(true);
    try {
      const { blob, fileName } = await backupService.build();
      setFile(new File([blob], fileName, { type: 'application/json' }));
      toast('백업 파일을 만들었어요.');
    } catch {
      toast('백업 파일을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBuilding(false);
    }
  };

  const share = async () => {
    if (!file) {
      return;
    }
    try {
      const result = await shareFile(file);
      if (result !== 'cancelled') {
        markBackedUp();
      }
    } catch {
      toast('공유하지 못했어요. 내려받기로 저장해 주세요.');
    }
  };

  const download = () => {
    if (!file) {
      return;
    }
    downloadFile(file, file.name);
    markBackedUp();
  };

  const restore = async (picked: File) => {
    let text: string;
    try {
      text = await picked.text();
    } catch {
      setFile(undefined);
      toast('불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const result = await backupService.restore(text).catch(() => undefined);
    // 불러오기로 데이터가 바뀌었을 수 있으니 미리 만든 백업 파일은 버린다.
    setFile(undefined);
    if (!result) {
      toast('불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    if (!result.ok) {
      toast(result.reason === 'not-backup' ? '뚜니레시피 백업 파일이 아니에요.' : '백업 파일이 손상됐어요.');
      return;
    }
    const { added, updated, unchanged } = result.counts;
    toast(`새로 ${added}개, 바뀐 ${updated}개, 그대로 ${unchanged}개예요.`);
  };

  // oxlint-disable-next-line react/purity -- 화면에 보일 때마다 최신 시각으로 다시 계산해야 하는 값이라 memo하지 않는다.
  const backupStale = recipeCount > 0 && (!lastBackupAt || Date.now() - lastBackupAt > 30 * DAY);

  return (
    <>
      <TopBar title="설정" />
      <div className="flex flex-col gap-3 px-4">
        {!isStandalone() && <Banner>홈 화면에 추가해서 쓰면 레시피가 지워질 걱정 없이 쓸 수 있어요.</Banner>}
        {backupStale && <Banner>마지막 백업이 30일 넘었어요. 백업 파일을 만들어 두세요.</Banner>}

        <Card>
          <h2 className="text-title-sm text-ink">백업</h2>
          <p className="mt-1 text-caption text-muted">
            {lastBackupAt ? `마지막 백업 ${formatDate(lastBackupAt)}` : '아직 백업하지 않았어요'}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {!file && (
              <Button block onClick={build} disabled={building}>
                {building ? '백업 파일을 만들고 있어요' : '백업 파일 만들기'}
              </Button>
            )}
            {file && canShareFile(file) && (
              <Button block onClick={share}>
                공유하기
              </Button>
            )}
            {file && (
              <Button variant="secondary" block onClick={download}>
                내려받기
              </Button>
            )}
            <Button variant="weak" block onClick={() => inputRef.current?.click()}>
              백업 불러오기
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const picked = e.target.files?.[0];
                e.target.value = '';
                if (picked) {
                  restore(picked);
                }
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-title-sm text-ink">저장 공간</h2>
          <p className="mt-1 text-body-md text-body-soft">
            레시피 {recipeCount}개{dataSize !== undefined ? ` · ${formatBytes(dataSize)}` : ''}
          </p>
        </Card>
      </div>
    </>
  );
}
