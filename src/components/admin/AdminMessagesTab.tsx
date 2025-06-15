
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

interface AdminMessagesTabProps {
  messages: Message[];
  onMarkMessageRead: (messageId: string) => void;
}

const AdminMessagesTab = ({ messages, onMarkMessageRead }: AdminMessagesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
        <CardDescription>View and respond to contact form messages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message: Message) => (
            <div key={message.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{message.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={message.status === 'unread' ? 'destructive' : 'default'}>
                    {message.status}
                  </Badge>
                  {message.status === 'unread' && (
                    <Button size="sm" onClick={() => onMarkMessageRead(message.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{message.email}</p>
              <p className="text-sm font-medium mb-2">{message.subject}</p>
              <p className="text-sm text-gray-700">{message.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMessagesTab;
