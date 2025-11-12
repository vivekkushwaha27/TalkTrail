using TalkTrail.Api.Model;

namespace TalkTrail.Api.Models
{
    public class GroupMessage
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int SenderId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Group Group { get; set; }
        public User Sender { get; set; }
    }
}
