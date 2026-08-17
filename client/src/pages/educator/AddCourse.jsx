import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";

import uniqid from "uniqid";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import axios from "axios";
import { toast } from "react-toastify";

import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  ImagePlus,
  Upload,
  X,
  Link as LinkIcon,
  Clock3,
  Eye,
  EyeOff,
  IndianRupee,
  Percent,
  Layers3,
  Save,
  FileText,
} from "lucide-react";

import { AppContext } from "../../context/AppContext";

const AddCourse = () => {
  const { backendUrl, getToken } =
    useContext(AppContext);

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // ==========================================
  // COURSE STATE
  // ==========================================

  const [courseTitle, setCourseTitle] =
    useState("");

  const [coursePrice, setCoursePrice] =
    useState(0);

  const [discount, setDiscount] =
    useState(0);

  const [image, setImage] =
    useState(null);

  const [chapters, setChapters] =
    useState([]);

  // ==========================================
  // UI STATE
  // ==========================================

  const [showPopup, setShowPopup] =
    useState(false);

  const [currentChapterId, setCurrentChapterId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [previewUrl, setPreviewUrl] =
    useState("");

  // ==========================================
  // LECTURE STATE
  // ==========================================

  const [lectureDetails, setLectureDetails] =
    useState({
      lectureTitle: "",
      lectureUrl: "",
      lecturePublicId: "",
      lectureDuration: "",
      isPreviewFree: false,
    });

  // ==========================================
  // VIDEO UPLOAD STATE
  // ==========================================

  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

  const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/mpeg",
    "video/3gpp",
  ];

  const [videoFile, setVideoFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [videoUploadError, setVideoUploadError] =
    useState("");

  const [useUrlMode, setUseUrlMode] =
    useState(false);

  const [previousPublicId, setPreviousPublicId] =
    useState("");

  // True once the current modal's uploaded video has been attached to a
  // lecture (added to the chapters array) so that closing the modal does
  // not delete a video that is now in use.
  const videoAttachedRef = useRef(false);

  // ==========================================
  // INITIALIZE QUILL
  // ==========================================

  useEffect(() => {
    if (
      !quillRef.current &&
      editorRef.current
    ) {
      quillRef.current = new Quill(
        editorRef.current,
        {
          theme: "snow",
          placeholder:
            "Describe what students will learn in this course...",
          modules: {
            toolbar: [
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
              ["clean"],
            ],
          },
        }
      );
    }
  }, []);

  // ==========================================
  // IMAGE PREVIEW
  // ==========================================

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url =
      URL.createObjectURL(image);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const finalPrice = useMemo(() => {
    const price = Number(coursePrice) || 0;
    const discountValue =
      Number(discount) || 0;

    return (
      price -
      (price * discountValue) / 100
    ).toFixed(2);
  }, [coursePrice, discount]);

  const totalLectures = useMemo(() => {
    return chapters.reduce(
      (total, chapter) =>
        total +
        (chapter.chapterContent?.length || 0),
      0
    );
  }, [chapters]);

  const totalDuration = useMemo(() => {
    return chapters.reduce(
      (total, chapter) =>
        total +
        (chapter.chapterContent || []).reduce(
          (sum, lecture) =>
            sum +
            (Number(
              lecture.lectureDuration
            ) || 0),
          0
        ),
      0
    );
  }, [chapters]);

  // ==========================================
  // ADD CHAPTER
  // ==========================================

  const addChapter = () => {
    const title = window.prompt(
      "Enter chapter name:"
    );

    if (!title?.trim()) return;

    const newChapter = {
      chapterId: uniqid(),
      chapterTitle: title.trim(),
      chapterContent: [],
      collapsed: false,
      chapterOrder:
        chapters.length > 0
          ? chapters[
              chapters.length - 1
            ].chapterOrder + 1
          : 1,
    };

    setChapters((prev) => [
      ...prev,
      newChapter,
    ]);
  };

  // ==========================================
  // REMOVE CHAPTER
  // ==========================================

  const removeChapter = (chapterId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this chapter?"
      );

    if (!confirmed) return;

    let removedPublicIds = [];
    setChapters((prev) => {
      const removedChapter = prev.find(
        (chapter) =>
          chapter.chapterId === chapterId
      );

      if (removedChapter) {
        removedPublicIds =
          removedChapter.chapterContent
            .map(
              (lecture) =>
                lecture.lecturePublicId
            )
            .filter(Boolean);
      }

      return prev.filter(
        (chapter) =>
          chapter.chapterId !== chapterId
      );
    });

    removedPublicIds.forEach((publicId) => {
      deleteCloudinaryVideo(publicId);
    });
  };

  // ==========================================
  // TOGGLE CHAPTER
  // ==========================================

  const toggleChapter = (chapterId) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.chapterId === chapterId
          ? {
              ...chapter,
              collapsed:
                !chapter.collapsed,
            }
          : chapter
      )
    );
  };

  // ==========================================
  // OPEN LECTURE MODAL
  // ==========================================

  const openLectureModal = (chapterId) => {
    setCurrentChapterId(chapterId);

    setLectureDetails({
      lectureTitle: "",
      lectureUrl: "",
      lecturePublicId: "",
      lectureDuration: "",
      isPreviewFree: false,
    });

    setVideoFile(null);
    setUploadProgress(0);
    setVideoUploadError("");
    setUseUrlMode(false);
    setPreviousPublicId("");
    videoAttachedRef.current = false;

    setShowPopup(true);
  };

  // ==========================================
  // CLOSE LECTURE MODAL
  // ==========================================

  const closeLectureModal = () => {
    // If a video was uploaded but never attached to a lecture (the
    // educator cancelled without clicking "Add Lecture"), remove it from
    // Cloudinary to avoid leaving orphaned assets.
    const unattachedPublicId =
      !videoAttachedRef.current
        ? lectureDetails.lecturePublicId
        : "";

    setShowPopup(false);
    setCurrentChapterId(null);

    setLectureDetails({
      lectureTitle: "",
      lectureUrl: "",
      lecturePublicId: "",
      lectureDuration: "",
      isPreviewFree: false,
    });

    setVideoFile(null);
    setUploadProgress(0);
    setVideoUploadError("");
    setUseUrlMode(false);
    setPreviousPublicId("");
    videoAttachedRef.current = false;

    if (unattachedPublicId) {
      deleteCloudinaryVideo(unattachedPublicId);
    }
  };

  // ==========================================
  // ADD LECTURE
  // ==========================================

  const addLecture = () => {
    if (
      !lectureDetails.lectureTitle.trim()
    ) {
      toast.error(
        "Please enter lecture title"
      );
      return;
    }

    if (
      !lectureDetails.lectureUrl.trim()
    ) {
      toast.error(
        "Please upload or paste a lecture video URL"
      );
      return;
    }

    // When using the upload flow, make sure the video was uploaded to
    // Cloudinary (lecturePublicId present) before adding the lecture.
    if (
      !useUrlMode &&
      !lectureDetails.lecturePublicId.trim()
    ) {
      toast.error(
        "Please upload the video before adding the lecture"
      );
      return;
    }

    if (
      Number(
        lectureDetails.lectureDuration
      ) <= 0
    ) {
      toast.error(
        "Lecture duration must be greater than 0"
      );
      return;
    }

    setChapters((prev) =>
      prev.map((chapter) => {
        if (
          chapter.chapterId !==
          currentChapterId
        ) {
          return chapter;
        }

        const newLecture = {
          ...lectureDetails,

          lectureDuration: Number(
            lectureDetails.lectureDuration
          ),

          lectureOrder:
            chapter.chapterContent.length >
            0
              ? chapter.chapterContent[
                  chapter.chapterContent
                    .length - 1
                ].lectureOrder + 1
              : 1,

          lectureId: uniqid(),
        };

        return {
          ...chapter,
          chapterContent: [
            ...chapter.chapterContent,
            newLecture,
          ],
        };
      })
    );

    toast.success(
      "Lecture added successfully"
    );

    // Mark the video as attached so closeLectureModal keeps it.
    videoAttachedRef.current = true;

    closeLectureModal();
  };

  // ==========================================
  // REMOVE LECTURE
  // ==========================================

  const removeLecture = (
    chapterId,
    lectureIndex
  ) => {
    const confirmed =
      window.confirm(
        "Remove this lecture?"
      );

    if (!confirmed) return;

    // Find the lecture being removed so we can clean up its uploaded
    // Cloudinary video (it is not referenced anywhere else yet).
    let removedLecture = null;
    setChapters((prev) =>
      prev.map((chapter) => {
        if (
          chapter.chapterId !== chapterId
        ) {
          return chapter;
        }

        removedLecture =
          chapter.chapterContent[
            lectureIndex
          ] || null;

        const updatedLectures =
          chapter.chapterContent.filter(
            (_, index) =>
              index !== lectureIndex
          );

        return {
          ...chapter,
          chapterContent:
            updatedLectures.map(
              (lecture, index) => ({
                ...lecture,
                lectureOrder:
                  index + 1,
              })
            ),
        };
      })
    );

    if (
      removedLecture?.lecturePublicId
    ) {
      deleteCloudinaryVideo(
        removedLecture.lecturePublicId
      );
    }
  };

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image"
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Thumbnail must be less than 5MB"
      );
      return;
    }

    setImage(file);
  };

  // ==========================================
  // VIDEO SELECT / UPLOAD / DELETE / REPLACE
  // ==========================================

  const resetVideoUploadState = () => {
    setVideoFile(null);
    setUploadProgress(0);
    setVideoUploadError("");
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error(
        "Invalid video type. Please upload MP4, WebM, OGG, MOV, AVI, MKV, MPEG or 3GP."
      );
      setVideoFile(null);
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(
        "Video file must be less than 500 MB"
      );
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setVideoUploadError("");
  };

  // Delete a previously uploaded Cloudinary video (a lecture that is
  // being removed or replaced before the course is published).
  const deleteCloudinaryVideo = async (publicId) => {
    try {
      const token = await getToken();

      await axios.post(
        `${backendUrl}/api/course/delete-video`,
        { publicId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Delete video error:",
        error
      );
    }
  };

  const uploadVideoToCloudinary = async () => {
    if (!videoFile) {
      toast.error(
        "Please select a video file first"
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setVideoUploadError("");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/course/upload-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) /
                  progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      if (!data.success) {
        setVideoUploadError(
          data.message ||
            "Video upload failed"
        );
        return;
      }

      const video = data.video;

      // Upload succeeded. The NEW video is now safe on Cloudinary, so it is
      // now okay to remove a previously uploaded (unsaved) version.
      if (
        previousPublicId &&
        previousPublicId !== video.publicId
      ) {
        await deleteCloudinaryVideo(
          previousPublicId
        );
      }

      setPreviousPublicId(video.publicId);

      setLectureDetails((prev) => ({
        ...prev,
        lectureUrl: video.url,
        lecturePublicId: video.publicId,
        lectureDuration: video.duration
          ? Math.max(
              1,
              Math.ceil(
                Number(video.duration) / 60
              )
            )
          : prev.lectureDuration,
      }));

      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error(
        "Upload video error:",
        error
      );

      setVideoUploadError(
        error.response?.data?.message ||
          error.message ||
          "Video upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove the currently attached video from Cloudinary and reset the
  // lecture's video fields.
  const removeUploadedVideo = async () => {
    const confirmed = window.confirm(
      "Remove this uploaded video?"
    );

    if (!confirmed) return;

    if (lectureDetails.lecturePublicId) {
      await deleteCloudinaryVideo(
        lectureDetails.lecturePublicId
      );
    }

    setPreviousPublicId("");
    resetVideoUploadState();

    setLectureDetails((prev) => ({
      ...prev,
      lectureUrl: "",
      lecturePublicId: "",
      lectureDuration: "",
    }));
  };

  // ==========================================
  // SUBMIT COURSE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseTitle.trim()) {
      toast.error(
        "Please enter course title"
      );
      return;
    }

    const description =
      quillRef.current?.root?.innerHTML ||
      "";

    const plainDescription =
      quillRef.current?.getText()?.trim() ||
      "";

    if (!plainDescription) {
      toast.error(
        "Please enter course description"
      );
      return;
    }

    if (!image) {
      toast.error(
        "Please upload course thumbnail"
      );
      return;
    }

    if (
      Number(coursePrice) < 0
    ) {
      toast.error(
        "Course price cannot be negative"
      );
      return;
    }

    if (
      Number(discount) < 0 ||
      Number(discount) > 100
    ) {
      toast.error(
        "Discount must be between 0 and 100"
      );
      return;
    }

    if (chapters.length === 0) {
      toast.error(
        "Please add at least one chapter"
      );
      return;
    }

    if (totalLectures === 0) {
      toast.error(
        "Please add at least one lecture"
      );
      return;
    }

    try {
      setSaving(true);

      const courseData = {
        courseTitle:
          courseTitle.trim(),

        courseDescription:
          description,

        coursePrice:
          Number(coursePrice),

        discount:
          Number(discount),

        courseContent:
          chapters,
      };

      const formData =
        new FormData();

      formData.append(
        "courseData",
        JSON.stringify(courseData)
      );

      formData.append(
        "courseThumbnail",
        image
      );

      const token =
        await getToken();

      const { data } =
        await axios.post(
          `${backendUrl}/api/educator/add-course`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      if (!data.success) {
        toast.error(
          data.message ||
            "Unable to create course"
        );
        return;
      }

      toast.success(
        "Course published successfully!"
      );

      // Reset
      setCourseTitle("");
      setCoursePrice(0);
      setDiscount(0);
      setImage(null);
      setChapters([]);

      if (quillRef.current) {
        quillRef.current.root.innerHTML =
          "";
      }
    } catch (error) {
      console.error(
        "Add course error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to add course"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
      >

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold mb-2">

              <BookOpen size={17} />

              Course Management

            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create New Course
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Build an engaging course for your
              students.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">

              <Layers3
                size={17}
                className="text-orange-500"
              />

              <span className="text-sm text-gray-600">
                {chapters.length} Chapters
              </span>

            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">

              <Video
                size={17}
                className="text-blue-500"
              />

              <span className="text-sm text-gray-600">
                {totalLectures} Lectures
              </span>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* MAIN GRID */}
        {/* ================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* ================================= */}
          {/* LEFT CONTENT */}
          {/* ================================= */}

          <div className="space-y-6">

            {/* COURSE BASIC INFO */}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

                    <FileText size={19} />

                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Course Information
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Add the basic details of your
                      course.
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                {/* TITLE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title
                  </label>

                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) =>
                      setCourseTitle(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Complete Python Programming"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition text-sm"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="mt-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Description
                  </label>

                  <div className="rounded-xl overflow-hidden border border-gray-200">

                    <div
                      ref={editorRef}
                      className="bg-white"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* CURRICULUM */}
            {/* ================================= */}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                      <Layers3 size={19} />

                    </div>

                    <div>

                      <h2 className="font-bold text-gray-900">
                        Course Curriculum
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Organize your course into
                        chapters and lectures.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={addChapter}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm"
                  >

                    <Plus size={17} />

                    Add Chapter

                  </button>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                {chapters.length === 0 ? (

                  <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 px-5 text-center">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">

                      <BookOpen size={26} />

                    </div>

                    <h3 className="font-semibold text-gray-800 mt-4">
                      No chapters yet
                    </h3>

                    <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                      Start building your curriculum
                      by adding your first chapter.
                    </p>

                    <button
                      type="button"
                      onClick={addChapter}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Plus size={16} />
                        Add First Chapter
                      </span>
                    </button>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {chapters.map(
                      (
                        chapter,
                        chapterIndex
                      ) => (

                        <div
                          key={
                            chapter.chapterId
                          }
                          className="border border-gray-200 rounded-2xl overflow-hidden"
                        >

                          {/* CHAPTER HEADER */}

                          <div className="bg-gray-50 px-4 sm:px-5 py-4">

                            <div className="flex items-center gap-3">

                              <button
                                type="button"
                                onClick={() =>
                                  toggleChapter(
                                    chapter.chapterId
                                  )
                                }
                                className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
                              >

                                {chapter.collapsed ? (
                                  <ChevronRight
                                    size={18}
                                  />
                                ) : (
                                  <ChevronDown
                                    size={18}
                                  />
                                )}

                              </button>

                              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                                {chapterIndex +
                                  1}
                              </div>

                              <div className="flex-1 min-w-0">

                                <h3 className="font-semibold text-gray-800 truncate">
                                  {chapter.chapterTitle}
                                </h3>

                                <p className="text-xs text-gray-400 mt-0.5">
                                  {
                                    chapter
                                      .chapterContent
                                      .length
                                  }{" "}
                                  {chapter
                                    .chapterContent
                                    .length ===
                                  1
                                    ? "lecture"
                                    : "lectures"}
                                </p>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeChapter(
                                    chapter.chapterId
                                  )
                                }
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                title="Delete chapter"
                              >

                                <Trash2
                                  size={17}
                                />

                              </button>

                            </div>

                          </div>

                          {/* CHAPTER CONTENT */}

                          {!chapter.collapsed && (

                            <div className="p-4 sm:p-5">

                              {chapter
                                .chapterContent
                                .length ===
                              0 ? (

                                <div className="py-7 text-center border border-dashed border-gray-200 rounded-xl">

                                  <Video
                                    size={23}
                                    className="mx-auto text-gray-300"
                                  />

                                  <p className="text-sm text-gray-400 mt-2">
                                    No lectures added
                                    yet
                                  </p>

                                </div>

                              ) : (

                                <div className="space-y-2">

                                  {chapter.chapterContent.map(
                                    (
                                      lecture,
                                      lectureIndex
                                    ) => (

                                      <div
                                        key={
                                          lecture.lectureId
                                        }
                                        className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition"
                                      >

                                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                                          <Video
                                            size={16}
                                          />

                                        </div>

                                        <div className="flex-1 min-w-0">

                                          <div className="flex flex-wrap items-center gap-2">

                                            <span className="text-xs font-semibold text-gray-400">
                                              {chapterIndex +
                                                1}
                                              .
                                              {lectureIndex +
                                                1}
                                            </span>

                                            <p className="text-sm font-medium text-gray-700 truncate">
                                              {
                                                lecture.lectureTitle
                                              }
                                            </p>

                                          </div>

                                          <div className="flex flex-wrap items-center gap-3 mt-1">

                                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">

                                              <Clock3
                                                size={
                                                  12
                                                }
                                              />

                                              {
                                                lecture.lectureDuration
                                              }{" "}
                                              min
                                            </span>

                                            {lecture.isPreviewFree ? (

                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium">

                                                <Eye
                                                  size={
                                                    11
                                                  }
                                                />

                                                Free
                                                Preview

                                              </span>

                                            ) : (

                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">

                                                <EyeOff
                                                  size={
                                                    11
                                                  }
                                                />

                                                Paid

                                              </span>

                                            )}

                                          </div>

                                        </div>

                                        <a
                                          href={
                                            lecture.lectureUrl
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                          className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-blue-500 hover:bg-blue-50"
                                          title="Open lecture"
                                        >

                                          <LinkIcon
                                            size={
                                              15
                                            }
                                          />

                                        </a>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeLecture(
                                              chapter.chapterId,
                                              lectureIndex
                                            )
                                          }
                                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                                          title="Delete lecture"
                                        >

                                          <Trash2
                                            size={
                                              15
                                            }
                                          />

                                        </button>

                                      </div>

                                    )
                                  )}

                                </div>

                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  openLectureModal(
                                    chapter.chapterId
                                  )
                                }
                                className="mt-4 w-full py-3 rounded-xl border border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 font-medium text-sm transition flex items-center justify-center gap-2"
                              >

                                <Plus size={17} />

                                Add Lecture

                              </button>

                            </div>

                          )}

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* ================================= */}
          {/* RIGHT SIDEBAR */}
          {/* ================================= */}

          <div className="space-y-6">

            {/* THUMBNAIL */}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

                    <ImagePlus size={19} />

                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Course Thumbnail
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Recommended 16:9 image
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5">

                <label
                  htmlFor="thumbnailImage"
                  className="block cursor-pointer"
                >

                  {previewUrl ? (

                    <div className="relative group">

                      <img
                        src={previewUrl}
                        alt="Course thumbnail"
                        className="w-full aspect-video object-cover rounded-xl border border-gray-200"
                      />

                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                        <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-700">

                          <Upload
                            size={16}
                          />

                          Change Image

                        </div>

                      </div>

                    </div>

                  ) : (

                    <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition flex flex-col items-center justify-center">

                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

                        <ImagePlus
                          size={23}
                        />

                      </div>

                      <p className="text-sm font-semibold text-gray-700 mt-3">
                        Upload thumbnail
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG or WEBP · Max 5MB
                      </p>

                    </div>

                  )}

                  <input
                    id="thumbnailImage"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      handleImageChange
                    }
                  />

                </label>

              </div>

            </section>

            {/* PRICING */}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                    <IndianRupee size={19} />

                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Course Pricing
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Set your course price
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5 space-y-4">

                {/* PRICE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price
                  </label>

                  <div className="relative">

                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      min="0"
                      value={coursePrice}
                      onChange={(e) =>
                        setCoursePrice(
                          e.target.value
                        )
                      }
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-sm"
                    />

                  </div>

                </div>

                {/* DISCOUNT */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          e.target.value
                        )
                      }
                      className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-sm"
                    />

                    <Percent
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                  </div>

                </div>

                {/* FINAL PRICE */}

                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">

                  <p className="text-xs text-orange-600 font-medium">
                    Student Price
                  </p>

                  <div className="flex items-end gap-2 mt-1">

                    <span className="text-2xl font-bold text-gray-900">
                      ₹{finalPrice}
                    </span>

                    {Number(discount) >
                      0 && (

                      <span className="text-sm text-gray-400 line-through mb-1">
                        ₹
                        {Number(
                          coursePrice || 0
                        ).toFixed(2)}
                      </span>

                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* COURSE SUMMARY */}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-5 py-5 border-b border-gray-100">

                <h2 className="font-bold text-gray-900">
                  Course Summary
                </h2>

              </div>

              <div className="p-5 space-y-3">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Chapters
                  </span>

                  <span className="font-semibold text-gray-800">
                    {chapters.length}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Lectures
                  </span>

                  <span className="font-semibold text-gray-800">
                    {totalLectures}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Total Duration
                  </span>

                  <span className="font-semibold text-gray-800">
                    {totalDuration} min
                  </span>

                </div>

                <div className="h-px bg-gray-100 my-2" />

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="font-semibold text-orange-600">
                    {Number(discount) || 0}%
                  </span>

                </div>

              </div>

            </section>

            {/* PUBLISH BUTTON */}

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >

              {saving ? (

                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                  Publishing...

                </>

              ) : (

                <>
                  <Save size={18} />

                  Publish Course

                </>

              )}

            </button>

            <p className="text-[11px] text-gray-400 text-center px-3">
              Make sure your course information,
              thumbnail and curriculum are complete
              before publishing.
            </p>

          </div>

        </div>

      </form>

      {/* ===================================== */}
      {/* LECTURE MODAL */}
      {/* ===================================== */}

      {showPopup && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeLectureModal}
          />

          {/* MODAL */}

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                  <Video size={19} />

                </div>

                <div>

                  <h2 className="font-bold text-gray-900">
                    Add Lecture
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Add lecture details below.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeLectureModal}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >

                <X size={19} />

              </button>

            </div>

            {/* BODY */}

            <div className="p-5 sm:p-6 space-y-4">

              {/* TITLE */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lecture Title
                </label>

                <input
                  type="text"
                  value={
                    lectureDetails.lectureTitle
                  }
                  onChange={(e) =>
                    setLectureDetails(
                      (prev) => ({
                        ...prev,
                        lectureTitle:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Introduction to Variables"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                />

              </div>

              {/* VIDEO / URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Video</label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-gray-100 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUseUrlMode(false); setVideoUploadError(""); }}
                    className={`py-1.5 rounded-lg text-sm font-medium transition ${!useUrlMode ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >Upload Video</button>
                  <button
                    type="button"
                    onClick={() => { setUseUrlMode(true); setVideoUploadError(""); }}
                    className={`py-1.5 rounded-lg text-sm font-medium transition ${useUrlMode ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >Paste URL</button>
                </div>

                {!useUrlMode ? (
                  <div className="space-y-3">
                    {lectureDetails.lectureUrl && lectureDetails.lecturePublicId ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm"><span>✓</span><span>Video uploaded successfully</span></div>
                        <p className="text-xs text-emerald-600 mt-1 truncate">{lectureDetails.lectureUrl}</p>
                        {videoFile && <p className="text-xs text-gray-500 mt-1">Selected: {videoFile.name}</p>}
                        <div className="flex gap-2 mt-3">
                          <label htmlFor="lectureVideoFile" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer transition"><Upload size={14} /> Replace Video</label>
                          <button type="button" onClick={removeUploadedVideo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition"><Trash2 size={14} /> Remove Video</button>
                        </div>
                      </div>
                    ) : uploading ? (
                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium"><span className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />Uploading...</div>
                        <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-orange-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} /></div>
                        <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
                      </div>
                    ) : (
                      <div>
                        <input id="lectureVideoFile" type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />
                        <label htmlFor="lectureVideoFile" className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Upload size={18} /></div>
                          <span className="text-sm font-semibold text-gray-700">Choose Video</span>
                          <span className="text-xs text-gray-400">MP4, WebM, MOV, AVI, MKV - max 500 MB</span>
                        </label>
                        {videoFile && <p className="text-xs text-gray-500 mt-2">Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</p>}
                        {videoUploadError && <p className="text-xs text-red-500 mt-2">{videoUploadError}</p>}
                        <button type="button" disabled={!videoFile} onClick={uploadVideoToCloudinary} className="mt-3 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-sm font-semibold transition">Upload Video</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={lectureDetails.lectureUrl}
                        onChange={(e) => setLectureDetails((prev) => ({ ...prev, lectureUrl: e.target.value }))}
                        placeholder="https://youtube.com/..."
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Paste a YouTube video URL for this lecture.</p>
                  </div>
                )}
              </div>

              {/* DURATION */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>

                <div className="relative">

                  <Clock3
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    min="1"
                    value={
                      lectureDetails.lectureDuration
                    }
                    onChange={(e) =>
                      setLectureDetails(
                        (prev) => ({
                          ...prev,
                          lectureDuration:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Minutes"
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                  />

                </div>

              </div>

              {/* FREE PREVIEW */}

              <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">

                    {lectureDetails.isPreviewFree ? (
                      <Eye size={17} />
                    ) : (
                      <EyeOff size={17} />
                    )}

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-gray-700">
                      Free Preview
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Allow students to watch this
                      lecture before enrollment.
                    </p>

                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={
                    lectureDetails.isPreviewFree
                  }
                  onChange={(e) =>
                    setLectureDetails(
                      (prev) => ({
                        ...prev,
                        isPreviewFree:
                          e.target.checked,
                      })
                    )
                  }
                  className="w-4 h-4 accent-orange-500"
                />

              </label>

            </div>

            {/* FOOTER */}

            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">

              <button
                type="button"
                onClick={closeLectureModal}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={addLecture}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition flex items-center gap-2"
              >

                <Plus size={16} />

                Add Lecture

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AddCourse;