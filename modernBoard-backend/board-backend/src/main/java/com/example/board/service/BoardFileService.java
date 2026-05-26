package com.example.board.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.board.dto.BoardFileDTO;
import com.example.board.dto.BoardFileDownloadDTO;
import com.example.board.dto.BoardUpdateDTO;
import com.example.board.mapper.BoardFileMapper;
import com.example.board.vo.BoardFileVO;
import com.example.board.vo.BoardVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardFileService {
	private final BoardFileMapper boardFilemapper;
	
	@Value("${file.upload.dir}")
	private String uploadDri;
	
	public void uploadsFiles(Long boardId, List<MultipartFile> files) {
		
		if(files == null || files.isEmpty()) {
			return;
		}
		
		String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
		String fullDirPath = uploadDri + datePath;
		
		File dir = new File(fullDirPath);
		if(!dir.exists()) {
			dir.mkdirs();
		}
		
		for(MultipartFile file : files) {
			if(file.isEmpty()) continue;
			
			try {
				String originalFilename = file.getOriginalFilename();
				
				String uuid = UUID.randomUUID().toString();
				String savedFilename = uuid + "-" + originalFilename;
				
				String saveAbsolutePath = fullDirPath + "/" + savedFilename;
				
				file.transferTo(new File(saveAbsolutePath));
				
				String dbFilePath = datePath + "/" + savedFilename;
				BoardFileVO fileVO = BoardFileVO.builder()
										.boardId(boardId)
										.originalName(originalFilename)
										.savedName(savedFilename)
										.filePath(dbFilePath)
										.fileSize(file.getSize())
										.build();
				
				boardFilemapper.insertFile(fileVO);
			
			}catch(IOException e) {
				log.error("파일 업로드 중 에러발생: " + e);
				throw new RuntimeException("파일 업로드 실패 : " + e );
			}
		}
	}

	
	public BoardFileDownloadDTO downloadFiles(Long fileId) {
		BoardFileVO vo = boardFilemapper.getbyIdFilesDownload(fileId);
		
		return BoardFileDownloadDTO.builder()
				.originalName(vo.getOriginalName())
				.filePath(vo.getFilePath())
				.build();
	}
	
	public List<BoardFileDTO> selectFiles(Long boardId) {
		List<BoardFileVO> voList = boardFilemapper.getbyIdFiles(boardId);
		
		
		return voList.stream()
				.map(vo -> BoardFileDTO.builder()
							.id(vo.getId())
							.boardId(vo.getBoardId())
							.originalName(vo.getOriginalName())
							.savedName(vo.getSavedName())
							.filePath(vo.getFilePath())
							.fileSize(vo.getFileSize())
							.build())
				.collect(Collectors.toList());
				
	}
}
