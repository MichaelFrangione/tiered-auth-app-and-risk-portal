export interface SubmissionHistoryEntry {
    changed_by_id: string;
    changed_by_name: string;
    changed_at: string; // ISO timestamp
    changes: Array<{
        field: 'risk';
        old_value: string;
        new_value: string;
    }>;
}

export interface SubmissionData {
    title: string;
    content: string;
    history?: SubmissionHistoryEntry[];
}

/**
 * Add a new history entry to submission data
 */
export function addHistoryEntry(
    currentData: SubmissionData,
    newTitle: string,
    newContent: string,
    userId: string,
    userName: string,
    oldRisk?: string,
    newRisk?: string
): SubmissionData {
    const changes: SubmissionHistoryEntry['changes'] = [];

    // Check for title changes
    if (currentData.title !== newTitle) {
        changes.push({
            field: 'title',
            old_value: currentData.title,
            new_value: newTitle
        });
    }

    // Check for content changes
    if (currentData.content !== newContent) {
        changes.push({
            field: 'content',
            old_value: currentData.content,
            new_value: newContent
        });
    }

    // Check for risk changes
    if (oldRisk && newRisk && oldRisk !== newRisk) {
        changes.push({
            field: 'risk',
            old_value: oldRisk,
            new_value: newRisk
        });
    }

    // If no changes, return current data unchanged
    if (changes.length === 0) {
        return currentData;
    }

    // Create new history entry
    const historyEntry: SubmissionHistoryEntry = {
        changed_by_id: userId,
        changed_by_name: userName,
        changed_at: new Date().toISOString(),
        changes
    };

    // Return updated data with new history entry
    return {
        title: newTitle,
        content: newContent,
        history: [...(currentData.history || []), historyEntry]
    };
}

/**
 * Format history entries for display in the UI
 */
export function formatHistoryForDisplay(history: SubmissionHistoryEntry[]): string[] {
    return history.map(entry => {
        const date = new Date(entry.changed_at);
        // Use consistent formatting to avoid hydration issues
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedTime = date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS

        const changeDescriptions = entry.changes
            .filter(change => change.field === 'risk') // Only show risk changes
            .map(change => {
                return `Risk from '${change.old_value || ''}' to '${change.new_value || ''}'`;
            });

        return `${entry.changed_by_name} changed ${changeDescriptions.join(' and ')} on ${formattedDate} at ${formattedTime}`;
    });
}

/**
 * Get the latest history entry for a submission
 */
export function getLatestHistoryEntry(data: SubmissionData): SubmissionHistoryEntry | null {
    if (!data.history || data.history.length === 0) {
        return null;
    }

    return data.history[data.history.length - 1];
}

/**
 * Check if submission has any history
 */
export function hasHistory(data: SubmissionData): boolean {
    return !!(data.history && data.history.length > 0);
}
