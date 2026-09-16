import ScannerWorkspace from '@/components/scanners/ScannerWorkspace';
import TypedHomeworkHelp from '@/components/homework/TypedHomeworkHelp';

export default function HomeworkHelperPage() {
  return <ScannerWorkspace mode="homework" beforeScanner={<TypedHomeworkHelp />} />;
}
