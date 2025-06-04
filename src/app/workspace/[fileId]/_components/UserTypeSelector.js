import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UserTypeSelector = ({ userType, setUserType, onClickHandler }) => {
  const accessChangeHandler = (type) => {
    setUserType(type);
    onClickHandler && onClickHandler(type);
  };

  return (
    <Select
      value={userType}
      onValueChange={(type) => accessChangeHandler(type)}
    >
      <SelectTrigger className="w-fit  border text-black">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white ">
        <SelectItem
          value="viewer"
          className=" cursor-pointer bg-dark-200 text-black focus:bg-dark-300 hover:bg-dark-300 focus:text-black"
        >
          can view
        </SelectItem>
        <SelectItem
          value="editor"
          className=" cursor-pointer bg-dark-200 text-black focus:bg-dark-300 hover:bg-dark-300 focus:text-black"
        >
          can edit
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
