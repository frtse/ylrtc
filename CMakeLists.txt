cmake_minimum_required(VERSION 3.0)
project (ylsfu)

if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
  message("Setting build type to 'Debug' as none was specified.")
  set(CMAKE_BUILD_TYPE Debug CACHE STRING "Choose the type of build." FORCE)
  # Set the possible values of build type for cmake-gui
  set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS "Debug" "Release"
    "MinSizeRel" "RelWithDebInfo")
endif()
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -fsanitize=address" CACHE STRING "Set C++ Compiler Flags" FORCE)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty_dir/include)

link_directories(${CMAKE_CURRENT_SOURCE_DIR}/thirdparty_dir/lib)

set(LINK_LIBRARYS sdptransform srtp2 ssl crypto spdlog boost_thread dl bz2 lzma z pthread)
file(GLOB LIB_SRC_LIST ./*.cpp)
LIST(FILTER LIB_SRC_LIST EXCLUDE REGEX main.cpp$)
LIST(FILTER LIB_SRC_LIST EXCLUDE REGEX _unittest.cpp$)
add_library(${PROJECT_NAME}-lib STATIC ${LIB_SRC_LIST})
target_link_libraries(${PROJECT_NAME}-lib ${LINK_LIBRARYS})

add_executable(${PROJECT_NAME} main.cpp)
target_link_libraries(${PROJECT_NAME} ${PROJECT_NAME}-lib)
file(GLOB TEST_SRC_LIST ./*_unittest.cpp ./test_main.cpp)
add_executable(${PROJECT_NAME}_test ${TEST_SRC_LIST})
target_link_libraries(${PROJECT_NAME}_test ${PROJECT_NAME}-lib gtest)