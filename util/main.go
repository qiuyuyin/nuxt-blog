package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

const FROM_DIST string = "F:\\ayili\\"

const TO_DIST string = "E:\\github_project\\nuxt-blog\\content\\posts\\"
const SHELL_PATH = "E:\\github_project\\nuxt-blog\\win.ps1"

type FileDetail struct {
	name string
	path string
}

func main() {
	args := os.Args
	if len(args) > 1 && args[1] == "gen" {
		cmd := exec.Command("powershell", "/C", SHELL_PATH)
		err := cmd.Run()
		if err != nil {
			log.Println("run error!")
		}
	}
	if len(args) > 1 && args[1] == "mv" {
		fileDetails := make([]FileDetail, 0)
		to_files_name := make([]string, 0)
		getPath := func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if strings.HasPrefix(info.Name(), ".") {
				return nil
			}
			if info.Name() == "temp" {
				return nil
			}
			if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
				if strings.Contains(path, "temp") {
					return nil
				}
				fileDetail := FileDetail{
					path: path,
					name: info.Name(),
				}
				fileDetails = append(fileDetails, fileDetail)
			}
			return nil
		}
		filepath.Walk(FROM_DIST, getPath)
		files, err := ioutil.ReadDir(TO_DIST)
		if err != nil {
			log.Fatal(err)
		}

		for _, f := range files {
			to_files_name = append(to_files_name, f.Name())
		}

		// if there is not exist , copy to the dst dir
		for i := range fileDetails {
			if !string_exit(fileDetails[i].name, to_files_name) {
				copy(fileDetails[i].path, TO_DIST+fileDetails[i].name)
			} else {
				// if the file is exist , check if it is update
				update_file(fileDetails[i].path, TO_DIST+fileDetails[i].name)
			}
		}
	}

	if len(args) > 1 && args[1] == "new" {
		file, err := os.Create(args[2] + ".md")
		defer file.Close()
		if err != nil {
			log.Println("file exist! change name!")
		}
		file.WriteString("---\n")
		title := ""
		fmt.Printf("please input md title: ")
		fmt.Scanf("%s\n", &title)
		// write the title into file
		file.WriteString("title: " + title + "\n")
		// get current time
		timeNow := time.Now().Format("2006-01-02 15:04:05")
		file.WriteString("date: " + timeNow + "\n")
		// input
		file.WriteString("categories: \n")
		file.WriteString(" -\n")
		file.WriteString("tags: \n")
		file.WriteString(" -\n")
		file.WriteString("---\n")
	}
}
func update_file(src, dst string) error {
	src_info, err := os.Stat(src)
	if err != nil {
		return err
	}
	dst_info, err := os.Stat(dst)
	if err != nil {
		return err
	}
	dst_optime := dst_info.Sys().(*syscall.Win32FileAttributeData)
	src_optime := src_info.Sys().(*syscall.Win32FileAttributeData)
	if dst_optime.LastWriteTime.HighDateTime != src_optime.LastWriteTime.LowDateTime {
		err := os.Remove(dst)
		if err != nil {
			return err
		}
		copy(src, dst)
	}
	return nil
}

func copy(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}

	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}
func string_exit(str string, strs []string) (res bool) {
	for i := range strs {
		if str == strs[i] {
			res = true
			return
		}
	}
	res = false
	return
}
