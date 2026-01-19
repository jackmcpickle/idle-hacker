export function Progress({
    progress,
}: {
    progress: number;
}): React.JSX.Element {
    return (
        <div className="relative pt-1">
            <div className="flex h-2 overflow-hidden rounded-sm bg-purple-200 text-xs">
                <div
                    style={{ width: `${progress}%` }}
                    className="flex flex-col justify-center bg-purple-500 text-center whitespace-nowrap text-white shadow-none"
                ></div>
            </div>
        </div>
    );
}
