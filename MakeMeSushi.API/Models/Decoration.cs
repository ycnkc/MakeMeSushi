namespace MakeMeSushi.API.Models
{
    public class Decoration
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Price { get; set; }
        public string ImagePath { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Örn: "Background", "TableItem", "Wall"
    }
}