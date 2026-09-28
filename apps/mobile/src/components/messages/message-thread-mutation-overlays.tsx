import { MessageActionsSheet } from '@/components/messages/message-actions-sheet';
import { MessageDeleteConfirmSheet } from '@/components/messages/message-delete-confirm-sheet';
import type { MessageThreadMutations } from '@/lib/messages/use-message-thread-mutations';

type MessageThreadMutationOverlaysProps = Pick<
  MessageThreadMutations,
  | 'actionTarget'
  | 'closeActionSheet'
  | 'handleActionEdit'
  | 'handleActionDelete'
  | 'deleteTarget'
  | 'closeDeleteConfirm'
  | 'confirmDelete'
  | 'deleting'
>;

export function MessageThreadMutationOverlays({
  actionTarget,
  closeActionSheet,
  handleActionEdit,
  handleActionDelete,
  deleteTarget,
  closeDeleteConfirm,
  confirmDelete,
  deleting,
}: MessageThreadMutationOverlaysProps) {
  return (
    <>
      <MessageActionsSheet
        visible={actionTarget !== null}
        onClose={closeActionSheet}
        onEdit={handleActionEdit}
        onDelete={handleActionDelete}
      />
      <MessageDeleteConfirmSheet
        visible={deleteTarget !== null}
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          void confirmDelete();
        }}
        deleting={deleting}
      />
    </>
  );
}
