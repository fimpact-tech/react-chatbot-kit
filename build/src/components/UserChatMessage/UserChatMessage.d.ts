import { ICustomComponents } from '../../interfaces/IConfig';
import './UserChatMessage.css';
interface IUserChatMessageProps {
    message: string;
    attachments?: File[];
    customComponents: ICustomComponents;
}
declare const UserChatMessage: ({ message, attachments, customComponents, }: IUserChatMessageProps) => JSX.Element;
export default UserChatMessage;
