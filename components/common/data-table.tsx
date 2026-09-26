import type { Column } from "@/lib/types";

interface Props<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
    columns,
    rows,
    rowKey,
    onRowClick,
}: Props<T>) {
    return (
        <div className="table-scroll">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} scope="col">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            onClick={
                                onRowClick ? () => onRowClick(row) : undefined
                            }
                            className={
                                onRowClick ? "cursor-pointer" : undefined
                            }
                        >
                            {columns.map((column) => (
                                <td key={column.key}>{column.render(row)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
