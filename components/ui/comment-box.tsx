import { Comment, User } from '@prisma/client';
import Link from 'next/link';
import React, { useState } from 'react';
import { getDateDiff } from '../../lib/client/utils';
import styles from './comment-box.module.scss';

interface CommentWithUser extends Comment {
  user: User;
}

interface CommentBoxProps {
  comment: CommentWithUser;
  userId: number | undefined;
  onDelete: (commentId: number, commentOwnerId: number) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  comment,
  userId,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  function toggleShowOptions() {
    setShowOptions((prev) => !prev);
  }
  function handleUpdateComment() {}
  function handleDeleteComment() {
    setShowOptions(false);
    onDelete(comment.id, comment.userId);
  }

  return (
    <div className={styles.container}>
      <nav></nav>
      <div className={styles.data}>
        <main>
          <div className={styles.avatar}></div>
          <div className={styles.wrapper}>
            <div className={styles.metadata}>
              <div className={styles.userinfo}>
                <Link href={`/users/${comment.userId}`}>
                  <a className={styles.nickname}>{comment.user.name}</a>
                </Link>
                <span className={styles.seperator}>&#183;</span>
                <span className={styles.time}>
                  {`${getDateDiff(new Date(), new Date(comment.createdAt))} 전`}
                </span>
              </div>
              <div className={styles['option-container']}>
                <button
                  className={styles['option-btn']}
                  onClick={toggleShowOptions}
                >
                  <svg
                    aria-hidden='true'
                    focusable='false'
                    data-prefix='dh'
                    data-icon='ellipsis-v'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    data-v-452d584e=''
                  >
                    <path
                      fill='currentColor'
                      d='M12.487 3a2.489 2.489 0 10.003 4.977A2.489 2.489 0 0012.487 3zm0 2a.488.488 0 110 .974.488.488 0 010-.973zm0 4.767a2.488 2.488 0 10.001 4.975 2.488 2.488 0 00-.001-4.975zm0 2a.488.488 0 110 .976.488.488 0 010-.976zm0 4.767a2.488 2.488 0 10.001 4.975 2.488 2.488 0 00-.001-4.975zm0 2a.487.487 0 11.002.974.487.487 0 01-.002-.974z'
                    ></path>
                  </svg>
                </button>
                {showOptions && (
                  <ul className={styles.options}>
                    <li>
                      <button
                        disabled={comment.userId !== userId}
                        onClick={handleUpdateComment}
                      >
                        수정
                      </button>
                    </li>
                    <li>
                      <button
                        disabled={comment.userId !== userId}
                        onClick={handleDeleteComment}
                      >
                        삭제
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            <div className={styles.contents}>
              <p>{comment.comment}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommentBox;
