import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../../lib/server/client';
import withHandler, { ResponseType } from '../../../lib/server/withHandler';
import { withApiSession } from '../../../lib/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  // 댓글 수정
  if (req.method === 'POST') {
    const {
      query: { id },
      body: { newComment },
    } = req;
    await client.comment.update({
      where: { id: +id },
      data: { comment: newComment },
    });
    return res.json({ ok: true });
  }

  // 댓글 삭제
  if (req.method === 'DELETE') {
    const {
      query: { id },
    } = req;
    await client.comment.delete({
      where: { id: +id },
    });
    return res.json({ ok: true });
  }
}

export default withApiSession(
  withHandler({
    methods: ['POST', 'DELETE'],
    privateMethods: ['POST', 'DELETE'],
    handler,
  })
);
