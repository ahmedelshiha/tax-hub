
export const entityNotificationTemplates = {
    'entity-submitted': (context: { businessName: string; userName: string; entityId: string }) => ({
        subject: `New Business Submission: ${context.businessName}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Business Registration</h2>
        <p><strong>${context.userName}</strong> has submitted a new business for approval.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Business Name:</strong> ${context.businessName}</p>
          <p style="margin: 8px 0 0;"><strong>Entity ID:</strong> ${context.entityId}</p>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/approvals/businesses" 
           style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Review Submission
        </a>
      </div>
    `,
        text: `New business submission from ${context.userName}: ${context.businessName}. Review at: ${process.env.NEXT_PUBLIC_APP_URL}/admin/approvals/businesses`
    }),

    'entity-approved': (context: { businessName: string; userName: string }) => ({
        subject: `Business Approved: ${context.businessName}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Business Approved!</h2>
        <p>Hello ${context.userName},</p>
        <p>Great news! Your business <strong>${context.businessName}</strong> has been approved and is now active.</p>
        
        <p>You can now manage your business, view licenses, and access services through your portal dashboard.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/businesses" 
           style="display: inline-block; background-color: #059669; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          Go to Dashboard
        </a>
      </div>
    `,
        text: `Great news! Your business ${context.businessName} has been approved. Access your dashboard at: ${process.env.NEXT_PUBLIC_APP_URL}/portal/businesses`
    }),

    'entity-rejected': (context: { businessName: string; userName: string; reason: string }) => ({
        subject: `Action Required: ${context.businessName} Submission Update`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Update Required</h2>
        <p>Hello ${context.userName},</p>
        <p>Thank you for submitting <strong>${context.businessName}</strong>. We need some additional information or changes before we can proceed.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #991b1b;">Reason:</strong>
          <p style="margin: 8px 0 0; color: #7f1d1d;">${context.reason}</p>
        </div>
        
        <p>Please review the feedback and update your submission.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/businesses" 
           style="display: inline-block; background-color: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Update Submission
        </a>
      </div>
    `,
        text: `Update required for ${context.businessName}. Reason: ${context.reason}. Please update your submission at: ${process.env.NEXT_PUBLIC_APP_URL}/portal/businesses`
    }),

    'verification-complete': (context: { businessName: string; userName: string }) => ({
        subject: `Verification Complete: ${context.businessName}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verification Successful</h2>
        <p>Hello ${context.userName},</p>
        <p>The automated verification for <strong>${context.businessName}</strong> has been completed successfully.</p>
        <p>Your business is now pending final admin approval. You will receive another notification once the review is complete.</p>
      </div>
    `,
        text: `Verification complete for ${context.businessName}. Your business is now pending final admin approval.`
    })
};
