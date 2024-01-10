import React from 'react';
import ConditionallyRender from 'react-conditionally-render';

import { callIfExists } from '../Chat/chatUtils';

import UserIcon from '../../assets/icons/user-alt.svg';

import './UserChatMessage.css';
import { ICustomComponents } from '../../interfaces/IConfig';

interface IUserChatMessageProps {
  message: string;
  attachments?: File[];
  customComponents: ICustomComponents;
}

const UserChatMessage = ({
  message,
  attachments,
  customComponents,
}: IUserChatMessageProps) => {
  const RenderedMessage = () => {
    if (!!customComponents.userChatMessage) {
      return callIfExists(customComponents.userChatMessage, {
        message,
      });
    }

    if (attachments && attachments.length > 0) {
      return (
        <div className="react-chatbot-kit-user-chat-message">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {attachments.map((attachment, index) => (
              <img
                key={`attachment-${index}`}
                src={URL.createObjectURL(attachment)}
                alt={attachment.name}
                style={{
                  width: '200px',
                  marginTop: '10px',
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="react-chatbot-kit-user-chat-message">
        {message}
        <div className="react-chatbot-kit-user-chat-message-arrow"></div>
      </div>
    );
  };

  return (
    <div className="react-chatbot-kit-user-chat-message-container">
      <RenderedMessage />
      <ConditionallyRender
        condition={!!customComponents.userAvatar}
        show={callIfExists(customComponents.userAvatar)}
        elseShow={
          <div className="react-chatbot-kit-user-avatar">
            <div className="react-chatbot-kit-user-avatar-container">
              <UserIcon className="react-chatbot-kit-user-avatar-icon" />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default UserChatMessage;
