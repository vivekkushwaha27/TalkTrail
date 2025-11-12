using System.ComponentModel.DataAnnotations;

namespace TalkTrail.Api.DTOs.Message
{
    public class SendMessageRequest
    {
        [Required]
        public int ReceiverId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;
    }
}
