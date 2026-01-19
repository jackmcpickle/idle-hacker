import { HackingJob } from '@/models/HackingJob';
import { HackJobCard } from './HackJobCard';
import type { ReactElement } from 'react';

export function HackJobList(): ReactElement {
    const jobs = HackingJob.getAll();

    return (
        <div className="space-y-4">
            {jobs.map((job) => (
                <HackJobCard
                    key={job.id}
                    job={job}
                />
            ))}
        </div>
    );
}
