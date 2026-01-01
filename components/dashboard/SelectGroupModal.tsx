import { FolderIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { AccountGroup } from "@/app/generated/prisma/client";
import Portal from "../Portal";

type GroupWithCount = AccountGroup & {
  _count: { accounts: number };
};

// -- Modal Pilih Group --
interface SelectGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupWithCount[];
  onSelectGroup: (groupId: string) => void;
  isLoading?: boolean;
}

const SelectGroupModal = ({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
  isLoading,
}: SelectGroupModalProps) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Select Group
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {groups.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No group available
              </div>
            ) : (
              <div className="space-y-1">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    disabled={isLoading}
                    onClick={() => onSelectGroup(group.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg group transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg">
                        <FolderIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                          {group.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {group._count.accounts} Accounts
                        </p>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default SelectGroupModal;
