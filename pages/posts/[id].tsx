import { Comment, Image, Post, Tag, User } from '@prisma/client';
import TextareaAutosize from 'react-textarea-autosize';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Layout from '../../components/layouts/layout';
import client from '../../lib/server/client';
import styles from './[id].module.scss';
import CommentBox from '../../components/ui/comment-box';
import Confirm, { initialConfirm } from '../../components/ui/confirm';
import useMutation from '../../lib/client/useMutation';
import useUser from '../../lib/client/useUser';
import LoadingSvg from '../../components/svg/loading-svg';
import { PostCommentResponse } from '../api/comments';
import { ResponseType } from '../../lib/server/withHandler';
import { useRouter } from 'next/router';
import Notice, { initialNotice } from '../../components/notification/notice';
import MakePost, { IPost } from '../../components/newPost/make-post';
import NoticeCtx from '../../store/notice-context';

interface CommentWithUser extends Comment {
  user: User;
}

interface WithPost extends Post {
  user: User;
  comments: CommentWithUser[];
  tags: Tag[];
  images: Image[];
}

interface PostDetailProps {
  post: WithPost;
}

interface IUpdatePost {
  show: boolean;
  prev: IPost;
}

const textareaFontSize = 17; //px

const PostDetail: NextPage<PostDetailProps> = ({ post }) => {
  const initialUpdatePost: IUpdatePost = {
    show: false,
    prev: {
      title: post.title,
      tags: post.tags.map((tag) => tag.tag),
      contents: post.contents,
      images: [''],
      subTitle: post.subTitle,
      showLikes: post.showLikes,
      allowComments: post.allowComments,
    },
  };
  const router = useRouter();
  const noticeCtx = useContext(NoticeCtx);
  const { user } = useUser();
  const [confirm, setConfirm] = useState(initialConfirm);
  const [updatePost, setUpdatePost] = useState(initialUpdatePost);
  const [comments, setComments] = useState(post.comments);
  const [textareaHeight, setTextareaHeight] = useState(70);
  const [
    addComment,
    {
      data: addCommentData,
      loading: addCommentIsLodding,
      error: addCommentError,
    },
  ] = useMutation<PostCommentResponse>({
    method: 'POST',
    url: `/api/comments`,
  });

  const date = new Date(post.createdAt);
  const newCommentRef = useRef<HTMLTextAreaElement>(null);

  function showDeleteConfirm() {
    setConfirm({
      show: true,
      message: '정말로 삭제하시겠습니까?',
      handleOk: handleDeletePost,
    });
  }

  function handleUpdatePost() {
    setUpdatePost((prev) => ({ ...prev, show: true }));
  }

  async function handleDeletePost() {
    setConfirm(initialConfirm);
    const response: ResponseType = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      router.push('/');
    }
  }

  function handleAddNewComment() {
    console.log('click');
    const comment = newCommentRef.current?.value.trim();
    if (!comment?.length) {
      noticeCtx?.failed({
        header: 'Error',
        message: '댓글을 작성하는데 실패했습니다.',
      });
      return;
    }
    addComment({ postId: post.id, comment });
  }
  async function handleDeleteComment(
    commentId: number,
    commentOwnerId: number
  ) {
    if (user?.id !== commentOwnerId) return;
    setComments(comments.filter((comment) => comment.id !== commentId));
    const response: ResponseType = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      noticeCtx?.successed({
        header: 'Success',
        message: '댓글을 삭제했습니다.',
      });
      return;
    }
    if (!response.ok) {
      noticeCtx?.failed({
        header: 'Error',
        message: 'Error code:500',
      });
      return;
    }
  }
  // function add
  useEffect(() => {
    if (addCommentData?.ok) {
      setComments((prev) => [addCommentData.newComment!, ...prev]);
      newCommentRef.current!.value = '';
    }
    if (addCommentError) {
      alert('오류 발생');
    }
  }, [addCommentData, addCommentError]);
  return (
    <div className={styles.wrapper}>
      {/* <Notice
        show={notice.show}
        isSuccessed={notice.isSuccessed}
        header={notice.header}
        message={notice.message}
        closeNotice={() => setNotice(initialNotice)}
      /> */}
      <Layout>
        {confirm.show && (
          <Confirm
            message={confirm.message}
            handleCancel={() =>
              setConfirm((prev) => ({ ...prev, show: false }))
            }
            handleOk={confirm.handleOk}
          />
        )}

        <div className={styles.container}>
          {updatePost.show && (
            <MakePost
              update={true}
              prevPost={updatePost.prev}
              closeNewPost={() => setUpdatePost(initialUpdatePost)}
            />
          )}
          <div className={styles.header}>
            <h1>{post.title}</h1>
            <div className={styles.metadata}>
              <div className={styles.info}>
                <span className={styles.username}>{post.user.name}</span>
                <span className={styles.separator}>&#183;</span>
                <span className={styles.date}>{`${date.getFullYear()}년 ${
                  date.getMonth() + 1
                }월 ${date.getDate()}일`}</span>
              </div>
              {post.userId === user?.id && (
                <div className={styles.manage}>
                  <button onClick={handleUpdatePost}>수정</button>
                  <button onClick={showDeleteConfirm}>삭제</button>
                </div>
              )}
            </div>
            <div className={styles.tags}>
              {post.tags.map((tag, idx) => (
                <Link key={idx} href='#'>
                  <a className={styles.tag}>{`#${tag.tag}`}</a>
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.fake}>
            <div className={styles['remote-controll']}>
              <div className={styles.likes}>
                <svg
                  aria-label='좋아요'
                  color='#262626'
                  fill='#000000'
                  // fill='#262626'
                  height='28'
                  role='img'
                  viewBox='0 0 24 24'
                  width='28'
                >
                  <path d='M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z'></path>
                </svg>
              </div>
              <div className={styles['likes-num']}>{post.likes}</div>
              <div className={styles.comments}>
                <svg
                  aria-label='댓글 달기'
                  color='#262626'
                  fill='#262626'
                  height='28'
                  role='img'
                  viewBox='0 0 24 24'
                  width='28'
                >
                  <path
                    d='M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z'
                    fill='none'
                    stroke='currentColor'
                    strokeLinejoin='round'
                    strokeWidth='2'
                  ></path>
                </svg>
              </div>
              <div className={styles['comments-num']}>{comments.length}</div>
            </div>
          </div>
          <div className={styles.main}>
            {/* <img/> */}
            <div className={styles.contents}>{post.contents}</div>
          </div>
          {post.allowComments ? (
            <div className={styles.comments}>
              {/* <div className={styles['division-line']}></div> */}
              <div className={styles['new-comment']}>
                {user ? (
                  <>
                    <textarea
                      ref={newCommentRef}
                      placeholder='댓글을 작성하세요'
                      style={{
                        height: `${textareaHeight}px`,
                        fontSize: `${textareaFontSize}px`,
                      }}
                      spellCheck='false'
                    ></textarea>
                    {/* <TextareaAutosize placeholder='댓글을 작성하세요' minRows={10} /> */}
                    <div className={styles['post-btn']}>
                      <button onClick={handleAddNewComment}>댓글 작성</button>
                    </div>
                  </>
                ) : (
                  <div className={styles.deactivated}>
                    로그인 후 댓글을 작성하실 수 있습니다.
                  </div>
                )}
                {addCommentIsLodding && (
                  <div className={styles.loading}>
                    <LoadingSvg width={100} />
                  </div>
                )}
              </div>
              {comments.length > 0 ? (
                <div className={styles['other-comments']}>
                  {comments &&
                    comments.map((comment, i) => (
                      <CommentBox
                        key={i}
                        comment={comment}
                        userId={user?.id}
                        onDelete={handleDeleteComment}
                      />
                    ))}
                </div>
              ) : (
                <div className={styles['no-comments']}>
                  아직 댓글이 없습니다. 먼저 대화를 시도해보세요!
                </div>
              )}
            </div>
          ) : (
            <div className={styles['not-allow-comment']}>
              댓글을 지원하지 않는 게시물입니다.
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await client.post.findMany({ select: { id: true } });
  return {
    fallback: 'blocking',
    paths: posts.map((post) => ({ params: { id: post.id.toString() } })),
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const post = await client.post.findUnique({
    where: { id: Number(ctx.params!.id) },
    include: {
      user: {
        select: { id: true, name: true, profileImage: true, posts: true },
      },
      tags: true,
      images: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  // const response: postDetailResponseType = await fetch(
  //   `/api/posts/${ctx.params!.id}`
  // ).then((res) => res.json());

  return {
    props: { post: JSON.parse(JSON.stringify(post)) },
    // props: { post: response.post },
  };
};

export default PostDetail;
