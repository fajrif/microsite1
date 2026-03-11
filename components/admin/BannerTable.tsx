'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Banner {
    id: string
    order_no: number
    image: string | null
    title: string | null
    caption: string | null
    short_description: string | null
    cta_button_text: string | null
    cta_button_href: string | null
}

interface BannerTableProps {
    banners: Banner[]
    isLoading: boolean
    onDelete: (id: string) => Promise<void>
}

export function BannerTable({ banners, isLoading, onDelete }: BannerTableProps) {
    const router = useRouter()
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            await onDelete(deleteId)
            setDeleteId(null)
        } catch (error) {
            console.error('Delete error:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Order</TableHead>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Caption</TableHead>
                            <TableHead>CTA</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                    No banners found
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell className="text-center font-medium">{banner.order_no}</TableCell>
                                    <TableCell>
                                        {banner.image ? (
                                            <img
                                                src={banner.image}
                                                alt={banner.title ?? 'Banner'}
                                                className="h-10 w-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                                No img
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[160px] truncate">
                                        <Link
                                            href={`/admin/banners/${banner.id}/edit`}
                                            className="hover:text-blue-600 hover:underline"
                                            title={banner.title ?? ''}
                                        >
                                            {banner.title || <span className="text-gray-400 italic">Untitled</span>}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-[160px] truncate text-gray-600">
                                        {banner.caption || '-'}
                                    </TableCell>
                                    <TableCell className="max-w-[140px] truncate text-gray-600">
                                        {banner.cta_button_text || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/admin/banners/${banner.id}/edit`)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Banner
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteId(banner.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Banner
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this banner.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClick} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
