export const Progress = ({ progress }: { progress: number }) => {
    return (
        <div className="relative pt-1">
            <div className="flex h-2 overflow-hidden text-xs bg-purple-200 rounded">
                <div
                    style={{ width: `${progress}%` }}
                    className="flex flex-col justify-center text-center text-white bg-purple-500 shadow-none  whitespace-nowrap"
                ></div>
            </div>
        </div>
    );
};
