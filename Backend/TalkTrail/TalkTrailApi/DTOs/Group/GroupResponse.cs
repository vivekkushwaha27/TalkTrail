using TalkTrail.Api.DTOs.Auth;

namespace TalkTrail.Api.DTOs.Group
{
    public class GroupResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
