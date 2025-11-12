using TalkTrail.Api.Models;

namespace TalkTrail.Api.Model
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User Sender { get; set; }
        public User Receiver { get; set; }
    }
}
