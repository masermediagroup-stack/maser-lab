import tkinter as tk
from pathlib import Path

image_path = Path(__file__).with_name("makeyourday-contact-sheet.png")

root = tk.Tk()
root.title("MakeYourDay viewport contact sheet")
root.geometry("960x820")

canvas = tk.Canvas(root, background="#121216")
vbar = tk.Scrollbar(root, orient="vertical", command=canvas.yview)
hbar = tk.Scrollbar(root, orient="horizontal", command=canvas.xview)
canvas.configure(yscrollcommand=vbar.set, xscrollcommand=hbar.set)

canvas.grid(row=0, column=0, sticky="nsew")
vbar.grid(row=0, column=1, sticky="ns")
hbar.grid(row=1, column=0, sticky="ew")
root.grid_rowconfigure(0, weight=1)
root.grid_columnconfigure(0, weight=1)

image = tk.PhotoImage(file=str(image_path))
canvas.create_image(0, 0, image=image, anchor="nw")
canvas.configure(scrollregion=(0, 0, image.width(), image.height()))

root.mainloop()
