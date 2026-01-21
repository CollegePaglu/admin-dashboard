/**
 * Export data to CSV file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values that contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export data to JSON file
 */
export const exportToJSON = (data, filename = 'export.json') => {
    if (!data) {
        console.warn('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Format data for export (flatten nested objects)
 */
export const flattenForExport = (data) => {
    return data.map(item => {
        const flattened = {};

        Object.keys(item).forEach(key => {
            const value = item[key];

            // Handle nested objects
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                Object.keys(value).forEach(nestedKey => {
                    flattened[`${key}_${nestedKey}`] = value[nestedKey];
                });
            } else if (Array.isArray(value)) {
                // Convert arrays to comma-separated strings
                flattened[key] = value.join(', ');
            } else {
                flattened[key] = value;
            }
        });

        return flattened;
    });
};
