# Templating

Templating in outgoing emails allows you to personalize content by embedding dynamic expressions like `{{ .Recipient.FullName }}`. These expressions reference fields from the conversation, contact, and recipient objects.

## Outgoing Email Template Expressions

If you want to customize the look of outgoing emails, you can do so in the Admin > Templates -> Outgoing Email Templates section. This template will be used for all outgoing emails including replies to conversations, notifications, and other system-generated emails.

### Conversation Variables

| Variable                        | Value                                                  |
|---------------------------------|--------------------------------------------------------|
| {{ .Conversation.ReferenceNumber }} | The unique reference number of the conversation     |
| {{ .Conversation.Subject }}         | The subject of the conversation                     |
| {{ .Conversation.UUID }}           | The unique identifier of the conversation            |

### Contact Variables
| Variable                     | Value                              |
|------------------------------|------------------------------------|
| {{ .Contact.FirstName }}     | First name of the contact/customer |
| {{ .Contact.LastName }}      | Last name of the contact/customer  |
| {{ .Contact.FullName }}      | Full name of the contact/customer  |
| {{ .Contact.Email }}         | Email address of the contact/customer |

### Recipient Variables
| Variable                       | Value                             |
|--------------------------------|-----------------------------------|
| {{ .Recipient.FirstName }}     | First name of the recipient       |
| {{ .Recipient.LastName }}      | Last name of the recipient        |
| {{ .Recipient.FullName }}      | Full name of the recipient        |
| {{ .Recipient.Email }}         | Email address of the recipient    |


### Example outgoing email template

```html
Dear {{ .Recipient.FirstName }}
{{ template "content" . }}
Best regards,
```
Here, the `{{ template "content" . }}` serves as a placeholder for the body of the outgoing email. It will be replaced with the actual email content at the time of sending.

Similarly, the `{{ .Recipient.FirstName }}` expression will dynamically insert the recipient's first name when the email is sent.
