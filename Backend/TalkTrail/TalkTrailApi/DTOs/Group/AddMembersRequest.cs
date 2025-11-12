using System.ComponentModel.DataAnnotations;

namespace TalkTrail.Api.DTOs.Group
{
    public class AddMembersRequest
    {
        [Required]
        public List<int> Members { get; set; } = new List<int>();
    }
}
