namespace MakeMeSushi.API.Models
{
    public class UserDecoration
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int DecorationId { get; set; }
        public bool IsEquipped { get; set; } // Kullanıcı bu eşyayı şu an dükkanında sergiliyor mu?
    }
}