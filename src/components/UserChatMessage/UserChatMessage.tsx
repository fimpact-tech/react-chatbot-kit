import React, { useEffect, useRef } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents } from '../../interfaces/IConfig';
import UserIcon from '../../assets/icons/user-alt.svg';
import './UserChatMessage.css';

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
  const attachmentsUrls = useRef<string[]>([]);

  useEffect(() => {
    // attachments가 업데이트될 때마다 URL 갱신
    if (attachments && attachments.length > 0) {
      attachmentsUrls.current = attachments.map((attachment) =>
        URL.createObjectURL(attachment)
      );
    }

    // 컴포넌트가 언마운트될 때 생성된 URL 해제
    return () => {
      attachmentsUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

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
            {attachmentsUrls.current.map((url, index) => (
              <img
                key={`attachment-${index}`}
                src={url}
                alt={attachments[index].name}
                style={{
                  maxWidth: '150px',
                  marginTop: index === 0 ? '0' : '10px',
                }}
              />
            ))}
          </div>
          <div className="react-chatbot-kit-user-chat-message-arrow"></div>
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
