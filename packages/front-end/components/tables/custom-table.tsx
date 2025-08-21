import * as React from 'react';
import {
	Column,
	ColumnDef,
	ColumnFiltersState,
	ColumnPinningState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	Row,
	RowData,
	SortingState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
export function CustomTableHeaderFilterButton<TData extends RowData>({
	children,
	column,
}: React.ComponentProps<'button'> & {
	column: Column<TData>;
}) {
	return (
		<Button
			variant="ghost"
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			className={cn(
				'text-muted-foreground text-xs pl-0! hover:bg-transparent!',
				column.getIsSorted() && 'text-primary',
			)}
		>
			{children}
			{column.getIsSorted() === false ? (
				<ArrowUpDown />
			) : column.getIsSorted() === 'desc' ? (
				<ArrowUp />
			) : (
				<ArrowDown />
			)}
		</Button>
	);
}

export default function CustomTable<TData extends RowData>(props: {
	columns: ColumnDef<TData>[];
	data: TData[];
	columnPinningState: ColumnPinningState;
	rowCursor: boolean;
	rowCNFn?: (row: Row<TData>) => clsx.ClassValue;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const table = useReactTable({
		data: props.data,
		columns: props.columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		initialState: {
			columnPinning: props.columnPinningState,
		},
	});

	return (
		<div className="w-full">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={cn(
												header.column.getIsPinned() ===
													'left' &&
													'sticky left-0 bg-background md:bg-transparent md:static',
												header.column.getIsPinned() ===
													'right' &&
													'sticky right-0 bg-background md:bg-transparent md:static',
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && 'selected'
									}
									className={cn(
										props.rowCursor && 'cursor-pointer',
										props.rowCNFn?.(row),
									)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												cell.column.getIsPinned() ===
													'left' &&
													'sticky left-0 bg-background md:bg-transparent md:static',
												cell.column.getIsPinned() ===
													'right' &&
													'sticky right-0 bg-background md:bg-transparent md:static',
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={props.columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
