using System.ComponentModel.DataAnnotations;
using TalkTrail.Api.Model;

namespace TalkTrail.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Message> SentMessages { get; set; }
        public ICollection<Message> ReceivedMessages { get; set; }

        public ICollection<GroupMember> GroupMembers { get; set; }
    }
}
