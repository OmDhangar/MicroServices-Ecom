"use client";

import React from "react";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { CategoryType, colors, ProductFormSchema, sizes } from "@repo/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";

// const categories = [
//   "T-shirts",
//   "Shoes",
//   "Accessories",
//   "Bags",
//   "Dresses",
//   "Jackets",
//   "Gloves",
// ] as const;

const fetchCategories = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories!");
  }

  return await res.json();
};

const AddProduct = () => {
  const [selectedFiles, setSelectedFiles] = React.useState<Record<string, File>>(
    {}
  );
  const [previews, setPreviews] = React.useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      categorySlug: "",
      sizes: [],
      colors: [],
      images: {},
    },
  });

  const { isPending, data } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof ProductFormSchema>) => {
      const token = await getToken();

      // 1. Create the product
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`,
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create product!");
      }

      const createdProduct = await res.json();
      const productId = createdProduct.id;

      // 2. Upload images for each color
      for (const color of data.colors) {
        const file = selectedFiles[color];
        if (file) {
          const formData = new FormData();
          formData.append("files[]", file); // product-service expects files[]
          formData.append("color", color);

          const uploadRes = await fetch(
            `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${productId}/upload`,
            {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!uploadRes.ok) {
            const uploadErr = await uploadRes.json();
            throw new Error(`Failed to upload image for ${color}: ${uploadErr.message}`);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Product and images uploaded successfully");
      form.reset();
      setSelectedFiles({});
      setPreviews({});
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (color: string, file: File | undefined) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [color]: file }));
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [color]: url }));

      // Update form value to satisfy validation
      const currentImages = form.getValues("images") || {};
      form.setValue("images", {
        ...currentImages,
        [color]: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", // Placeholder for Zod validation
      });
    } else {
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[color];
        return next;
      });
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[color];
        return next;
      });
      const currentImages = form.getValues("images") || {};
      const nextImages = { ...currentImages };
      delete nextImages[color];
      form.setValue("images", nextImages);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form
                className="space-y-8 pb-20"
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {data && (
                  <FormField
                    control={form.control}
                    name="categorySlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.map((cat: CategoryType) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Enter the category of the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {sizes.map((size) => (
                            <div className="flex items-center gap-2" key={size}>
                              <Checkbox
                                id={`size-${size}`}
                                checked={field.value?.includes(size)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, size]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((v) => v !== size)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor={`size-${size}`} className="text-xs">
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available sizes for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 my-2">
                            {colors.map((color) => (
                              <div
                                className="flex items-center gap-2"
                                key={color}
                              >
                                <Checkbox
                                  id={`color-${color}`}
                                  checked={field.value?.includes(color)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, color]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((v) => v !== color)
                                      );
                                      // Also remove image for this color
                                      handleFileChange(color, undefined);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`color-${color}`}
                                  className="text-xs flex items-center gap-2"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {color}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available colors for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images (S3 Upload)</FormLabel>
                      <FormControl>
                        <div className="">
                          {form.watch("colors")?.map((color) => (
                            <div
                              className="mb-6 flex flex-col gap-2"
                              key={color}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-sm font-medium">
                                  {color.charAt(0).toUpperCase() + color.slice(1)}:
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(color, e.target.files?.[0])}
                                />
                                {previews[color] && (
                                  <div className="relative w-12 h-12 rounded overflow-hidden border">
                                    <img
                                      src={previews[color]}
                                      alt="Preview"
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                )}
                              </div>
                              {field.value?.[color] ? (
                                <span className="text-green-600 text-[10px] font-semibold">
                                  ✓ Ready for upload
                                </span>
                              ) : (
                                <span className="text-red-500 text-[10px]">
                                  ⚠ Image required
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Configuring product & uploading..." : "Create Product"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
