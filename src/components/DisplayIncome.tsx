import { useGlobalStateProvider } from '@/state/context';

export function DisplayIncome(): React.JSX.Element {
    const { state } = useGlobalStateProvider();
    return (
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
                Income
            </h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">
                        Bank
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        ${state.bank}
                    </dd>
                </div>
            </dl>
        </div>
    );
}
