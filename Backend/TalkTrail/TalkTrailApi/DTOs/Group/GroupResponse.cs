using TalkTrail.Api.DTOs.Auth;

namespace TalkTrail.Api.DTOs.Group
{
    public class GroupResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CreatedById { get; set; }
        public List<UserDto> Members { get; set; } = new List<UserDto>();
    }
}
