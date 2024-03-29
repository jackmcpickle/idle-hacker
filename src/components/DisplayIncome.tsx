import { useGlobalStateProvider } from '@/state/context';

export const DisplayIncome = () => {
    const { state } = useGlobalStateProvider();
    return (
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
                Income
            </h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        Bank
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        ${state.bank}
                    </dd>
                </div>
            </dl>
        </div>
    );
};
