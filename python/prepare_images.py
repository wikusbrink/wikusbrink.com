import os, sys
from PIL import Image, ImageOps


preview_size = (300, 300)
people_size = (400, 400)
max_size = (1028, 1028)
root = '../images/'
output_root = '../src/public/images/'
file_types = ['.JPG', '.jpg', '.jpeg']

aspect_ratios = []
for i in range(1, 7):
    for j in range(1, 7):
        aspect_ratios.append(float(i) / j)
aspect_ratios = sorted(list(set(aspect_ratios)))

for directory in os.listdir(root):
    if os.path.isdir(os.path.join(root, directory)):

        # Make previews
        c = 0;
        for image in os.listdir(os.path.join(root, directory)):
            if os.path.isfile(os.path.join(root, directory, image)):
                _, extension = os.path.splitext(image)
                if extension in file_types:
                    print 'preview ' + directory + ' ' + image
                    c = c + 1
                    im = Image.open(os.path.join(root, directory, image))
                    image = ImageOps.fit(im, preview_size, Image.ANTIALIAS)
                    image.thumbnail(preview_size, Image.ANTIALIAS)
                    image.save(os.path.join(output_root, directory, 'preview', str(c) + '.jpg'))

        # Make people shots
        print(os.path.join(root, directory, 'people'))
        if os.path.isdir(os.path.join(root, directory, 'people')):
            for image in os.listdir(os.path.join(root, directory, 'people')):
                if os.path.isfile(os.path.join(root, directory, 'people', image)):
                    filename, extension = os.path.splitext(image)
                    if extension in file_types:
                        print 'people ' + directory + ' ' + image
                        im = Image.open(os.path.join(root, directory, 'people', image))
                        image = ImageOps.fit(im, people_size, Image.ANTIALIAS)
                        image.thumbnail(people_size, Image.ANTIALIAS)
                        image.save(os.path.join(output_root, directory, 'people', filename + '.jpg'))

        # Resize images
        for image in os.listdir(os.path.join(root, directory)):
            if os.path.isfile(os.path.join(root, directory, image)):
                filename, extension = os.path.splitext(image)
                if extension in file_types:
                    im = Image.open(os.path.join(root, directory, image))
                    (width, height) = im.size
                    aspect_ratio = float(width) / height;
                    new_aspect_ratio = aspect_ratios[min(range(len(aspect_ratios)), key=lambda i: abs(aspect_ratios[i]-aspect_ratio))]
                    if (new_aspect_ratio * height / width < 1):
                        size = (int(width), int(width / new_aspect_ratio))
                    else:
                        size = (int(new_aspect_ratio * height), int(height))
                    image = ImageOps.fit(im, size, Image.ANTIALIAS)
                    if width > 1028 or height > 1028:
                        image.thumbnail(max_size, Image.ANTIALIAS)

                    print 'image ' + directory + ' ' + filename + ' ' + str(round(new_aspect_ratio, 2))
                    image.save(os.path.join(output_root, directory, filename + ' ' + str(round(new_aspect_ratio, 2)) + '.jpg'))
