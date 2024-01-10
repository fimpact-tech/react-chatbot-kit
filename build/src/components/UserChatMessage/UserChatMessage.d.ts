import './UserChatMessage.css';
import { ICustomComponents } from '../../interfaces/IConfig';
interface IUserChatMessageProps {
    message: string;
    attachments?: File[];
    customComponents: ICustomComponents;
}
declare const UserChatMessage: ({ message, attachments, customComponents, }: IUserChatMessageProps) => JSX.Element;
export default UserChatMessage;
