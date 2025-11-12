using System.ComponentModel.DataAnnotations;

namespace TalkTrail.Api.DTOs.Message
{
    public class SendMessageRequest
    {
        [Required]
        public int ReceiverId { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;
    }
}
