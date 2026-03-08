type Props = {
	Button: React.ReactNode;
	SubMenu?: React.ReactNode;
};

export default function Menu({ Button, SubMenu }: Props) {
	return (
		<div className="flex gap-2 pt-2">
			{Button}
			{SubMenu}
		</div>
	);
}
