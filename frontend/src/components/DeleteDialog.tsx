// frontend/src/components/DeleteDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteDialog = ({ open, onConfirm, onCancel }: Props) => {
  return (
    <Dialog.Root open={open} onOpenChange={onCancel}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
          <Dialog.Title className="text-lg font-bold">
            タスクの削除
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            本当にこのタスクを削除しますか？この操作は取り消せません。
          </Dialog.Description>
          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                キャンセル
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                削除
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
