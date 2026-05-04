'use client'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Award } from 'lucide-react'
import { toast } from 'sonner'

interface PromoDraftDialogProps {
  promoDraft: string | null
  onClose: () => void
}

export function PromoDraftDialog({ promoDraft, onClose }: PromoDraftDialogProps) {
  if (!promoDraft) return null

  return (
    <Dialog open={!!promoDraft} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Performance Achievement Draft
          </DialogTitle>
          <DialogDescription>
            AI-synthesized STAR-format bullet point based on your high-impact work.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-6 rounded-xl border font-medium leading-relaxed italic text-foreground whitespace-pre-wrap">
          {promoDraft}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(promoDraft)
            toast.success('Copied to clipboard!')
          }}>
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
