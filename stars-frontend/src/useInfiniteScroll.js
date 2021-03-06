import { useRef, useCallback } from 'react'

const useInfiniteScroll = (callback, isFetching, uid, lastNote, complete, userId, value) => {
  //here we use useRef to store a DOM node and the returned object will persist regardless of re-renders
  const observer = useRef()

  //useCallback takes a callback argument and an array dependency list and returns a memoized callback
  //which is guaranteed to have the same reference
  const lastElementRef = useCallback((node) => {
    if (isFetching) return

    //stop watching targets, you can think of it as a reset
    if (observer.current) observer.current.disconnect()
    if (complete) return

    //create a new intersection observer and execute the callback incase of an intersecting event
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (callback.name === 'getMoreSearchPosts' || callback.name === 'getMoreUserSearchPosts') {
          callback(uid, lastNote, userId, value)
        } else {
          callback(uid, lastNote, userId)
        }
      }
    }, { threshold: 1 });

      //if there is a node, let the intersection observer watch that node
    if (node) observer.current.observe(node)
  }, [callback, isFetching, uid, lastNote, complete, userId, value])

  //return reference to the last element
  return [lastElementRef]
}

export default useInfiniteScroll