import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Steps } from 'antd';
import { StepProps } from 'antd/lib';
import { ReactNode } from 'react';
export default function StepsDialog({
	loading,
	currentStep,
	steps,
	children,
	successContent,
	showCloseButton = false,
	...props
}: {
	loading: boolean;
	currentStep: number;
	steps: StepProps[];
	successContent: ReactNode;
	showCloseButton?: boolean;
} & React.ComponentProps<typeof Dialog>) {
	return (
		<Dialog {...props}>
			<DialogContent
				showCloseButton={showCloseButton}
				onPointerDownOutside={(e) => e.preventDefault()}
				className="md:max-w-5xl p-0"
			>
				<div className="relative flex flex-col gap-6 p-6">
					<LoadingMask
						className="flex justify-center items-center top-0 left-0"
						loading={loading}
					>
						<LoadingSpinner size={36} />
					</LoadingMask>
					<Steps
						current={currentStep}
						items={steps}
						className="justify-center"
					/>
					<div className="w-full flex-col items-center gap-4 flex relative">
						{currentStep < steps.length ? (
							<>{children}</>
						) : (
							<>{successContent}</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
