import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileAvatar: React.FC = () => {
  return (
    <Avatar>
      <AvatarImage src="./defaultProfileAvatar.png" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
