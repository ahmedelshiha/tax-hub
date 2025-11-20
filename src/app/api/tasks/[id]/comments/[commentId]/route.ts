import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { respond } from '@/lib/api-response'
import { TaskCommentUpdateSchema } from '@/schemas/shared/entities/task'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * PUT /api/tasks/[id]/comments/[commentId]
 * Update a comment (comment author or admin only)
 */
export const PUT = withTenantContext(
  async (request, { user, tenantId }, { params }) => {
    try {
      const { id: taskId, commentId } = await params

      // Verify task exists
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          tenantId,
        },
      })

      if (!task) {
        return respond.notFound('Task not found')
      }

      // Verify comment exists
      const comment = await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          taskId,
        },
      })

      if (!comment) {
        return respond.notFound('Comment not found')
      }

      // Check authorization: only author or admin can update
      if (!user.isAdmin && comment.authorId !== user.id) {
        return respond.forbidden('You do not have permission to update this comment')
      }

      const body = await request.json()
      const updates = TaskCommentUpdateSchema.parse(body)

      const updated = await prisma.taskComment.update({
        where: { id: commentId },
        data: updates,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      return respond.ok({ data: updated })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid comment data', error.errors)
      }
      console.error('Comment update error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * DELETE /api/tasks/[id]/comments/[commentId]
 * Delete a comment (comment author or admin only)
 */
export const DELETE = withTenantContext(
  async (request, { user, tenantId }, { params }) => {
    try {
      const { id: taskId, commentId } = await params

      // Verify task exists
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          tenantId,
        },
      })

      if (!task) {
        return respond.notFound('Task not found')
      }

      // Verify comment exists
      const comment = await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          taskId,
        },
      })

      if (!comment) {
        return respond.notFound('Comment not found')
      }

      // Check authorization: only author or admin can delete
      if (!user.isAdmin && comment.authorId !== user.id) {
        return respond.forbidden('You do not have permission to delete this comment')
      }

      // Delete the comment (cascade will handle replies)
      await prisma.taskComment.delete({
        where: { id: commentId },
      })

      return respond.ok({ success: true, message: 'Comment deleted successfully' })
    } catch (error) {
      console.error('Comment deletion error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
