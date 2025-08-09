export default function FieldSet({
	title,
	comment,
	children,
	className,
}: {
	title: string;
	comment?: string;
} & React.ComponentProps<'fieldset'>) {
	return (
		<fieldset className={className}>
			<div className="flex flex-col gap-2">
				<h4 className="leading-normal text-sm font-medium">{title}</h4>
				{children}
				<p className="leading-normal text-xs text-muted-foreground">
					{comment}
				</p>
			</div>
		</fieldset>
	);
}
