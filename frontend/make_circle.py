from PIL import Image, ImageDraw

def make_circle_icon(input_path, output_path):
    try:
        # Open the image
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate bounding box for a perfect circle using the shorter dimension
        width, height = img.size
        min_dim = min(width, height)
        
        # Create a square image with a transparent background
        square_img = Image.new("RGBA", (min_dim, min_dim), (0, 0, 0, 0))
        
        # Paste the center of original image into the square
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        
        cropped_img = img.crop((left, top, right, bottom))
        square_img.paste(cropped_img, (0, 0))
        
        # Create a circular mask
        mask = Image.new("L", (min_dim, min_dim), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, min_dim, min_dim), fill=255)
        
        # Apply mask
        square_img.putalpha(mask)
        
        # Save as PNG
        square_img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Process app/icon.png
make_circle_icon("app/icon.png", "app/icon.png")

# Process public/icon.png
make_circle_icon("public/icon.png", "public/icon.png")

# Process public/logo.png
make_circle_icon("public/logo.png", "public/logo.png")

# Convert public/icon.png to public/favicon.ico (circular)
try:
    img = Image.open("public/icon.png").convert("RGBA")
    img.save("public/favicon.ico", format="ICO", sizes=[(32, 32), (64, 64)])
    print("Successfully generated circular favicon.ico")
except Exception as e:
    print(f"Error generating favicon.ico: {e}")
