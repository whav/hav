from PIL import Image, ImageDraw, ImageFont

def generate_image(text, width=800, height=600, output=None, margin=80):
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    size = 10
    text_width = 1
    text_height = 1
    desired_text_size = (img.width - margin * 2, img.height - margin * 2)
    while (text_width, text_height) < desired_text_size:
        fnt = ImageFont.truetype('./font.ttf', size=size)
        text_width, text_height = draw.textsize(text, font=fnt)
        size += 10

    # calculate position of top left corner of text
    text_position = (
        width / 2 - text_width / 2,
        height / 2 - text_height / 2
    )
    draw.text(text_position, text, font=fnt)
    if output:
        img.save(output)
    return img


