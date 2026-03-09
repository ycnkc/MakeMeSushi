namespace MakeMeSushi.API.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string ItemName { get; set; } = string.Empty;

        public bool IsEquipped { get; set; }

        public DateTime PurchasedAt { get; set; } = DateTime.Now;

        public User User { get; set; } = null!;
    }
}
