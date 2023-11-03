import { AiFillHeart } from "react-icons/ai"
import { FaShare, FaCommentDots } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useUser } from "../context/user"
import { BiLoaderCircle } from "react-icons/bi"
import { useGeneralStore } from "../stores/general"
import { useRouter } from "next/navigation"
import { Comment, Like, PostMainLikesCompTypes } from "../types"
import useGetCommentsByPostId from "../hooks/useGetCommentsByPostId"
import useGetLikesByPostId from "../hooks/useGetLikesByPostId"
import useIsLiked from "../hooks/useIsLiked"
import useCreateLike from "../hooks/useCreateLike"
import useDeleteLike from "../hooks/useDeleteLike"

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {

    let { setIsLoginOpen } = useGeneralStore();

    const router = useRouter()
    const contextUser = useUser()
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [likes, setLikes] = useState<Like[]>([])

    useEffect(() => { 
        getAllLikesByPost()
        getAllCommentsByPost()
    }, [post])

    useEffect(() => { hasUserLikedPost() }, [likes, contextUser])

    const getAllCommentsByPost = async () => {
        let result = await useGetCommentsByPostId(post?.id)
        setComments(result)
    }

    const getAllLikesByPost = async () => {
        let result = await useGetLikesByPostId(post?.id)
        setLikes(result)
    }

    const hasUserLikedPost = () => {
        if (!contextUser) return

        if (likes?.length < 1 || !contextUser?.user?.id) {
            setUserLiked(false)
            return
        }
        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)
        setUserLiked(res ? true : false)
    }

    const like = async () => {
        setHasClickedLike(true)
        await useCreateLike(contextUser?.user?.id || '', post?.id)
        await getAllLikesByPost()
        hasUserLikedPost()
        setHasClickedLike(false)
    }

    const unlike = async (id: string) => {
        setHasClickedLike(true)
        await useDeleteLike(id)
        await getAllLikesByPost()
        hasUserLikedPost()
        setHasClickedLike(false)
    }

    const likeOrUnlike = () => {
        if (!contextUser?.user?.id) {
            setIsLoginOpen(true)
            return
        }
        
        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)

        if (!res) {
            like()
        } else {
            likes.forEach((like: Like) => {
                if (contextUser?.user?.id == like?.user_id && like?.post_id == post?.id) {
                    unlike(like?.id) 
                }
            })
        }
    }

    const sharePost = async () => {
        if (navigator.share) {
            try {
                
                await navigator.share({
                    title: "Check out this post",
                    text: post.text,
                    url: `${window.location.href}post/${post.id}/${post.user_id}`,
                });
            } catch (error) {
               
                alert("Error sharing post");
            }
        } else {
  
            alert("Web Share API is not supported in your browser. You can manually share the post.");
        }
    }
    

    return (
        <>
            <div id={`PostMainLikes-${post?.id}`} className="relative md:mr-[75px]">
                <div className="absolute bottom-0 pl-2">
                    <div className="pb-4 text-center">
                        <button 
                            disabled={hasClickedLike}
                            onClick={() => likeOrUnlike()} 
                            className="rounded-full bg-gray-200 p-2 cursor-pointer"
                        >
                            {!hasClickedLike ? (
                                <AiFillHeart color={likes?.length > 0 && userLiked ? '#ff2626' : ''} size="25"/>
                            ) : (
                                <BiLoaderCircle className="animate-spin" size="25"/>
                            )}
                            
                        </button>
                        <span className="text-xs text-gray-800 font-semibold">
                            {likes?.length}
                        </span>
                    </div>

                    <button 
                        onClick={() => router.push(`/post/${post?.id}/${post?.profile?.user_id}`)} 
                        className="pb-4 text-center"
                    >
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
                            <FaCommentDots size="25"/>
                        </div>
                        <span className="text-xs text-gray-800 font-semibold">{comments?.length}</span>
                    </button>

                    <button className="text-center">
                        <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
                        <FaShare size="25" onClick={sharePost} />
                        </div>
                        {/* <span className="text-xs text-gray-800 font-semibold"></span> */}
                    </button>
                </div>
            </div>
        </>
    )
}
